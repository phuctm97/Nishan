import { MongoClient } from 'mongodb';
import path from 'path';
import fs from 'fs';
import { load } from 'js-yaml';

import { fetchDatabaseData } from './fetchDatabaseData';
import {
	CollectionBlockExtracted,
	CollectionExtracted,
	FetchDatabaseDataResult,
	LocalFileStructure,
	TViewExtracted
} from './types';
import { ICollection, TCollectionBlock, TView } from '@nishans/types';

const extractCollectionBlockData = (block_data: TCollectionBlock) => ({
	id: block_data.id,
	collection_id: block_data.collection_id,
	view_ids: block_data.view_ids
});

const extractCollectionData = (collection_data: ICollection) => ({
	name: collection_data.name,
	icon: collection_data.icon,
	cover: collection_data.cover,
	id: collection_data.id,
	schema: collection_data.schema,
	parent_id: collection_data.parent_id
});

const extractViewsData = (views_data: TView[]) =>
	views_data.map((view_data) => ({
		id: view_data.id,
		type: view_data.type,
		name: view_data.name,
		format: view_data.format,
		query2: view_data.query2,
		parent_id: view_data.parent_id
	}));

async function storeToMongodb (arg: LocalFileStructure, extract?: boolean) {
	const client = new MongoClient('mongodb://localhost:27017', { useNewUrlParser: true, useUnifiedTopology: true });
	try {
		await client.connect();
		const { block, collection, views } = arg;
		const db = client.db(`${collection.name}`),
			block_collection = await db.createCollection<CollectionBlockExtracted>('block'),
			collection_collection = await db.createCollection<CollectionExtracted>('collection'),
			views_collection = await db.createCollection<TViewExtracted>('views');

		await block_collection.insertOne(block);
		await collection_collection.insertOne(collection);
		await views_collection.insertMany(views);
	} finally {
		await client.close();
	}
}

export async function storeInLocalMongodbFromNotion (token: string, database_id: string) {
	const { block_data, collection_data, views_data } = await fetchDatabaseData(token, database_id);

	await storeToMongodb({
		block: extractCollectionBlockData(block_data),
		collection: extractCollectionData(collection_data),
		views: extractViewsData(views_data)
	});
}

export async function storeInLocalMongodbFromFile (file_path: string) {
	const client = new MongoClient('mongodb://localhost:27017', { useNewUrlParser: true, useUnifiedTopology: true });
	const ext = path.extname(file_path);
	try {
		await client.connect();
		let data: LocalFileStructure = {} as any;
		if (ext === '.json') {
			data = JSON.parse(await fs.promises.readFile(file_path, 'utf-8'));
		} else if (ext === '.yaml' || ext === '.yml') {
			data = load(await fs.promises.readFile(file_path, 'utf-8')) as LocalFileStructure;
		} else
			throw new Error('Unsupported output file extension. Use either json or yaml file when speciying the filepath');
		await storeToMongodb(data);
	} finally {
		await client.close();
	}
}
