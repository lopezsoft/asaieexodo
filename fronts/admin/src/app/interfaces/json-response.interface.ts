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


