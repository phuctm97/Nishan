import { GetPageVisitsParams, GetPageVisitsResult, GetUserSharedPagesParams, GetUserSharedPagesResult, GetUserTasksResult, GetPublicPageDataParams, GetPublicPageDataResult, GetPublicSpaceDataParams, GetPublicSpaceDataResult, GetSubscriptionDataParams, GetSubscriptionDataResult, InitializePageTemplateParams, InitializePageTemplateResult, LoadBlockSubtreeParams, LoadBlockSubtreeResult, GetSpacesResult, GetGenericEmbedBlockDataParams, GetGenericEmbedBlockDataResult, GetUploadFileUrlParams, GetUploadFileUrlResult, GetGoogleDriveAccountsResult, InitializeGoogleDriveBlockParams, InitializeGoogleDriveBlockResult, GetBackLinksForBlockResult, FindUserResult, SyncRecordValuesParams, SyncRecordValuesResult, QueryCollectionParams, QueryCollectionResult, LoadUserContentResult, LoadPageChunkParams, LoadPageChunkResult, TDataType } from "@nishans/types";
import axios from "axios";

import { Configs, ConfigsWithoutUserid } from "../src";

const BASE_NOTION_URL = "https://www.notion.so/api/v3"

const returnPromise = <T>(url: string, arg: any, configs: Configs | ConfigsWithoutUserid): Promise<T> => {
  const {token, interval} = configs;
  const headers = {
    headers: {
      cookie: `token_v2=${token};notion_user_id=${(configs as Configs).user_id ?? ''};`,
      ["x-notion-active-user-header"]: (configs as Configs).user_id ?? ''
    }
  }
  return new Promise((resolve, reject) => {
    setTimeout(async () => {
      try {
        const { data } = await axios.post<T>(
          `${BASE_NOTION_URL}/${url}`,
          arg,
          headers
        );
        resolve(data)
      } catch (err) {
        reject(err.response.data)
      }
    }, interval ?? 500)
  });
}

export async function getPageVisits(params: GetPageVisitsParams, configs: ConfigsWithoutUserid){
  return await returnPromise<GetPageVisitsResult>("getPageVisits", params, configs)
}

export async function getUserSharedPages(params: GetUserSharedPagesParams, configs: ConfigsWithoutUserid){
  return await returnPromise<GetUserSharedPagesResult>("getUserSharedPages", params, configs);
}

export async function getUserTasks(configs: Configs){
  return await returnPromise<GetUserTasksResult>("getUserTasks", {}, configs);
}

export async function getPublicPageData(params: GetPublicPageDataParams, configs: ConfigsWithoutUserid){
  return await returnPromise<GetPublicPageDataResult>("getPublicPageData", params, configs)
}

export async function getPublicSpaceData(params: GetPublicSpaceDataParams, configs: ConfigsWithoutUserid){
  return await returnPromise<GetPublicSpaceDataResult>("getPublicSpaceData", params, configs);
}

export async function getSubscriptionData(params: GetSubscriptionDataParams, configs: Configs){
  return await returnPromise<GetSubscriptionDataResult>("getSubscriptionData", params, configs);
}