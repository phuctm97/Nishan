import { ParentProps, Node, IViewFilter, ViewAggregations, SpaceShardProps } from './';

export type TViewType = 'table' | 'list' | 'board' | 'gallery' | 'calendar' | 'timeline';
export type TViewFormatCover = { type: 'page_content' | 'page_cover' } | { type: 'property'; property: string };

export type TView = ITableView | IListView | IBoardView | IGalleryView | ICalendarView | ITimelineView;
export type TViewUpdateInput = Partial<TView>;

export interface IViewQuery2 {
	aggregations: ViewAggregations[];
	sort: ViewSorts[];
	filter: IViewFilter;
}

export type TViewQuery2 =
	| ITableViewQuery2
	| IListViewQuery2
	| IBoardViewQuery2
	| ICalendarViewQuery2
	| IGalleryViewQuery2
	| ITimelineViewQuery2;
export interface ITableViewFormat {
	table_wrap: boolean;
	table_properties: ViewFormatProperties[];
}

export type ITableViewQuery2 = Partial<IViewQuery2>;
export interface ITableView extends Node, ParentProps, SpaceShardProps {
	name: string;
	type: 'table';
	page_sort: string[];
	format: ITableViewFormat;
	query2?: ITableViewQuery2;
}

export interface IListViewFormat {
	list_properties: ViewFormatProperties[];
}

export type IListViewQuery2 = Partial<Omit<IViewQuery2, 'aggregations'>>;
export interface IListView extends Node, ParentProps, SpaceShardProps {
	name: string;
	type: 'list';
	format: IListViewFormat;
	query2?: IListViewQuery2;
}

export interface IBoardViewFormat {
	board_cover: TViewFormatCover;
	board_cover_aspect?: 'contain' | 'cover';
	board_cover_size?: 'small' | 'medium' | 'large';
	board_groups2: { hidden: boolean; property: string; value: { type: 'select' | 'multi_select'; value: string } }[];
	board_properties: ViewFormatProperties[];
}

export type IBoardViewQuery2 = Partial<IViewQuery2> & {
	group_by: string;
};

export interface IBoardView extends Node, ParentProps, SpaceShardProps {
	type: 'board';
	name: string;
	format: IBoardViewFormat;
	query2?: IBoardViewQuery2;
}

export interface IGalleryViewFormat {
	gallery_cover?: TViewFormatCover;
	gallery_cover_aspect?: 'contain' | 'cover';
	gallery_cover_size?: 'small' | 'medium' | 'large';
	gallery_properties: ViewFormatProperties[];
}

export type IGalleryViewQuery2 = Partial<Omit<IViewQuery2, 'aggregations'>>;

export interface IGalleryView extends Node, ParentProps, SpaceShardProps {
	type: 'gallery';
	name: string;
	format: IGalleryViewFormat;
	query2?: IGalleryViewQuery2;
}

export interface ICalendarViewFormat {
	calendar_properties: ViewFormatProperties[];
}

export type ICalendarViewQuery2 = Partial<Omit<IViewQuery2, 'aggregations'>> & {
	calendar_by: string;
};

export interface ICalendarView extends Node, ParentProps, SpaceShardProps {
	type: 'calendar';
	name: string;
	format: ICalendarViewFormat;
	query2?: ICalendarViewQuery2;
}

export interface ITimelineViewFormatPreference {
	centerTimestamp: number;
	zoomLevel: 'month';
}

export interface ITimelineViewFormat {
	timeline_preference: ITimelineViewFormatPreference;
	timeline_properties: ViewFormatProperties[];
	timeline_show_table: boolean;
	timeline_table_properties: ViewFormatProperties[];
}

export type ITimelineViewQuery2 = Partial<IViewQuery2> & {
	timeline_by: TTimelineViewTimelineby;
};
export interface ITimelineView extends Node, ParentProps, SpaceShardProps {
	type: 'timeline';
	name: string;
	format: ITimelineViewFormat;
	query2: ITimelineViewQuery2;
}

export type TTimelineViewTimelineby = 'hours' | 'day' | 'week' | 'bi_week' | 'month' | 'quarter' | 'year';

export interface ViewFormatProperties {
	width?: number;
	visible: boolean;
	property: string;
}

export interface ViewSorts {
	property: string;
	direction: 'ascending' | 'descending';
}
