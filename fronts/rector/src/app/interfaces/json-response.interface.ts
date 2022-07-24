
export interface SearchParams {
	search?: string;
	searchType?: number;
	start?: number;
	limit?: number; 
	isDocumentSupport : boolean;
}

export interface Report {
  pathFile: string;
  success: boolean;
}


export interface JsonResponse {
  success: boolean;
  message: string;
  pathFile: string;
  records: [];
  total: number;
  error: string;
  report: Report;
}


