import { ICollection, ISpace, ISpaceView, IUserRoot, RecordMap, SyncRecordValues, TBlock, TDataType } from '@nishans/types';
import { validateCache, constructNotionHeaders } from '../utils';
import { getSpaces, queryCollection, syncRecordValues } from '../src';
import { Configs, CtorArgs, ICache, NotionHeaders, UpdateCacheManuallyParam } from './types';

export default class Cache {
	cache: ICache;
	token: string;
	interval: number;
	headers: NotionHeaders;
	user_id: string;

	constructor ({ cache, token, interval, user_id }: Omit<CtorArgs, 'shard_id' | 'space_id'>) {
		this.cache = (cache && validateCache(cache)) || {
			block: new Map(),
			collection: new Map(),
			space: new Map(),
			collection_view: new Map(),
			notion_user: new Map(),
			space_view: new Map(),
			user_root: new Map(),
			user_settings: new Map()
		};
		this.headers = constructNotionHeaders({token, user_id});
		this.token = token;
		this.interval = interval ?? 500;
		this.user_id = this.headers.headers["x-notion-active-user-header"];
	}

	getConfigs = (): Configs => {
		return {
			token: this.token,
			user_id: this.user_id,
			interval: this.interval
		};
	};

	/**
   * Save the passed recordMap to cache
   * @param recordMap RecordMap map to save to cache
   */
	saveToCache (recordMap: Partial<RecordMap>) {
		(Object.keys(this.cache) as (keyof ICache)[]).forEach((key) => {
			if (recordMap[key])
				Object.entries(recordMap[key] as Record<any, any>).forEach(([ record_id, record_value ]) => {
					this.cache[key].set(record_id, record_value.value);
				});
		});
	}

	returnNonCachedData (update_cache_param: UpdateCacheManuallyParam): UpdateCacheManuallyParam {
		return update_cache_param.filter(
			(info) => !Boolean(Array.isArray(info) ? this.cache[info[1]].get(info[0]) : this.cache.block.get(info))
		);
  }
  
  async initializeCache(){
    const data = await getSpaces({token: this.token, interval: 0}); 
    const external_notion_users: Set<string> = new Set();
    Object.values(data).forEach(recordMap => {
      const user_root_id = Object.keys(recordMap.user_root)[0];
      Object.values(recordMap.space).forEach(space => space.value.permissions.forEach(permission =>
        permission.user_id && permission.user_id !== user_root_id && external_notion_users.add(permission.user_id)
      ))
      this.saveToCache(recordMap)
    });

    const external_notion_users_arr = Array.from(external_notion_users.values());

    if(external_notion_users_arr.length !== 0){
      const { recordMap } = await syncRecordValues({
        requests: external_notion_users_arr.map(external_notion_user => ({ table: "notion_user", id: external_notion_user, version: -1 }))
      }, {token: this.token, interval: 0});
      
      this.saveToCache(recordMap);
    }
  }

	async updateCacheManually (args: UpdateCacheManuallyParam | string) {
		const sync_record_values: SyncRecordValues[] = [];
		if (Array.isArray(args))
      args.forEach((arg: string | [string, TDataType]) => {
				if (Array.isArray(arg)) sync_record_values.push({ id: arg[0], table: arg[1], version: 0 });
				else if (typeof arg === 'string')
          sync_record_values.push({ id: arg, table: 'block', version: 0 })
        else
          throw new Error(`Unsupported argument passed`)
			});
    else if (typeof args === 'string') sync_record_values.push({ id: args, table: 'block', version: 0 });
    else
      throw new Error(`Unsupported argument passed`);

    if (sync_record_values.length){
      const data = await syncRecordValues({ requests: sync_record_values }, {token: this.token, interval: 0});
      this.saveToCache(data.recordMap);
    } else
      console.log('Empty sync_record_values')
	}

	async updateCacheIfNotPresent (arg: UpdateCacheManuallyParam) {
		const sync_record_values: SyncRecordValues[] = [];
		arg.forEach((arg: string | [string, TDataType]) => {
			if (Array.isArray(arg) && !this.cache[arg[1]].get(arg[0]))
				sync_record_values.push({ id: arg[0], table: arg[1], version: 0 });
			else if (typeof arg === 'string' && !this.cache.block.get(arg))
				sync_record_values.push({ id: arg, table: 'block', version: 0 });
		});
		if (sync_record_values.length) {
      const data = await syncRecordValues({ requests: sync_record_values }, {token: this.token, interval: 0});
      this.saveToCache(data.recordMap);
    } else
      console.log('Empty sync_record_values')
  }
  
  async initializeCacheForSpecificData(id: string, type: TDataType){
    const container: UpdateCacheManuallyParam = [];
    if (type === "block") {
      const data = this.cache[type].get(id) as TBlock;
      if (data.type === "page")
        container.push(...data.content);
      if (data.type === "collection_view" || data.type === "collection_view_page") {
        data.view_ids.map((view_id) => container.push([view_id, "collection_view"]))
        container.push([data.collection_id, "collection"])
      }
    } else if (type === "space") {
      const data = this.cache[type].get(id) as ISpace;
      container.push(...data.pages);
      data.permissions.forEach((permission) => container.push([permission.user_id, "notion_user"]))
    } else if (type === "user_root"){
      const data = this.cache[type].get(id) as IUserRoot;
      data.space_views.map((space_view => container.push([space_view, "space_view"])))
    }
    else if (type === "collection") {
      const data = this.cache[type].get(id) as ICollection;
      if((data as ICollection).template_pages)
        container.push(...data.template_pages as string[])
      const {recordMap} = await queryCollection({
        collectionId: id,
        collectionViewId: "",
        query: {},
        loader: {
          type: "table",
          loadContentCover: true
        }
      }, {
        token: this.token,
        interval: 0
      })
      this.saveToCache(recordMap);
    }
    else if (type === "space_view"){
      const data = this.cache[type].get(id) as ISpaceView;
      if(data.bookmarked_pages)
        container.push(...data.bookmarked_pages)
    }
    else
      throw new Error(`${type} data is not supported`);

    const non_cached = this.returnNonCachedData(container);
    
    await this.updateCacheManually(non_cached);

    // If the block is a page, for all the collection block contents, fetch the collection attached with it as well
    if(type === "block"){
      const data = this.cache[type].get(id) as TBlock;
      if(data.type === "page"){
        const collection_blocks_ids: UpdateCacheManuallyParam = [];
        for (let index = 0; index < data.content.length; index++) {
          const content_id = data.content[index],
            content = this.cache.block.get(content_id)
          if(content && (content.type === "collection_view_page" || content.type === "collection_view"))
            collection_blocks_ids.push([content.collection_id, "collection"])
        }
        await this.updateCacheManually(this.returnNonCachedData(collection_blocks_ids));
      }
    }
  }
}
