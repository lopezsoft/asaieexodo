export interface Report {
  pathFile: string;
  success: boolean;
}

export interface DataRecords {
  current_page: number;
  first_page_url: string;
  from: number;
  last_page: number;
  last_page_url: string;
  links: [];
  next_page_url: string;
  path: string;
  per_page: number;
  prev_page_url: string;
  to: number;
  total: number;
  data: [];
}


export interface JsonResponse {
  success: boolean;
  message: string;
  pathFile: string;
  records: [];
  total: number;
  error: string;
  report: Report;
  dataRecords: DataRecords;
}


