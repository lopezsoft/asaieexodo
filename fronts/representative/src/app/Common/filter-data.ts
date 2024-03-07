import {IStudent, IVotingData} from "../interfaces/school-params.interface";

export class FilterData {
  public static getCandidates(votingData: IVotingData[], student: IStudent): Array<IVotingData> {
    let data: IVotingData[];
    // Filtra los candidatos voto en blanco
    const whiteCandidacies    = votingData.filter(voting => voting.type === 1);
    // Filtra los candidatos que deben salir en todos los grados y mesas.
    const allGradeCandidates  = votingData.filter(voting => voting.availability_status === 1);
    // Filtra los candidatos que deben salir solo en el grado de matrícula del votante.
    const candidates          = votingData.filter(voting => voting.availability_status === 2);
    // Filtra a los candidatos por grado.
    const gradeCandidates     = candidates.filter(voting => voting.id_grade === student.id_grade);
    // Agrupa todos los candidatos.
    const allCandidates       = [...allGradeCandidates, ...gradeCandidates];
    // Se filtran los votos en blanco que no tenga candidaturas en todos los candidatos.
    const filterWhiteCandidacies = whiteCandidacies.filter(white => allCandidates.find(candidate => candidate.candidacy_id === white.candidacy_id));
    data = [...filterWhiteCandidacies, ...allCandidates]
    return data;
  }
}