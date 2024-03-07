import * as moment from 'moment';

export function convertTo24HourFormat(dateString: string): string {
  // Parsea la fecha usando moment.js con el formato específico de entrada
  const format = 'YYYY-MM-DD h:mm A'; // Asegúrate de que el formato coincida con tu entrada
  const momentDate = moment(dateString, format);
  
  // Convierte la fecha a formato ISO String o a cualquier otro formato necesario
  return momentDate.format('YYYY-MM-DDTHH:mm:ss');
}
