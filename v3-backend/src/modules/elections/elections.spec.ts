import { BullRegistrar, getQueueToken } from '@nestjs/bullmq';
import { ValidationPipe } from '@nestjs/common';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { Test, TestingModule } from '@nestjs/testing';
import * as net from 'node:net';
import { AppModule } from '../../app.module';
import { GlobalExceptionFilter } from '../../shared/infrastructure/http/filters/global-exception.filter';
import { SmartLoggerService } from '../../shared/infrastructure/logging/smart-logger.service';
import { JASPER_REPORTS_QUEUE } from '../reporting/infrastructure/queues/jasper-report.processor';
import { ManageElectionsUseCase } from './application/use-cases/manage-elections.use-case';

function isTcpOpen(host: string, port: number): Promise<boolean> {
  return new Promise((resolve) => {
    const socket = new net.Socket();
    socket.setTimeout(800);
    socket.once('connect', () => {
      socket.destroy();
      resolve(true);
    });
    socket.once('error', () => {
      socket.destroy();
      resolve(false);
    });
    socket.once('timeout', () => {
      socket.destroy();
      resolve(false);
    });
    socket.connect(port, host);
  });
}

describe('Sprint 7 — School Elections, Stations, Candidates & Live Tally (RLS)', () => {
  let app: NestFastifyApplication;
  let moduleRef: TestingModule;
  let postgresAvailable = false;

  beforeAll(async () => {
    const dbHost = process.env.DB_HOST ?? '127.0.0.1';
    const dbPort = Number(process.env.DB_PORT ?? '5434');
    const redisHost = process.env.REDIS_HOST ?? '127.0.0.1';
    const redisPort = Number(process.env.REDIS_PORT ?? '6384');

    postgresAvailable = await isTcpOpen(dbHost, dbPort);
    const redisAvailable = await isTcpOpen(redisHost, redisPort);

    const builder = Test.createTestingModule({ imports: [AppModule] });
    if (!redisAvailable) {
      builder
        .overrideProvider(BullRegistrar)
        .useValue({ onModuleInit: () => undefined, register: () => undefined })
        .overrideProvider(getQueueToken(JASPER_REPORTS_QUEUE))
        .useValue({
          on: jest.fn(),
          add: jest.fn(),
          getJob: jest.fn(),
          close: jest.fn().mockResolvedValue(undefined),
        });
    }

    moduleRef = await builder.compile();
    app = moduleRef.createNestApplication<NestFastifyApplication>(
      new FastifyAdapter(),
    );
    app.setGlobalPrefix('api/v1');
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );
    app.useGlobalFilters(new GlobalExceptionFilter(app.get(SmartLoggerService)));
    await app.init();
    await app.getHttpAdapter().getInstance().ready();
  });

  afterAll(async () => {
    if (app) {
      await app.close();
    }
  });

  it('rejects unauthenticated requests to elections endpoints with 401', async () => {
    const fastify = app.getHttpAdapter().getInstance();
    for (const url of [
      '/api/v1/elections/candidacy-types',
      '/api/v1/elections',
      '/api/v1/elections/active-ballot',
    ]) {
      const res = await fastify.inject({ method: 'GET', url });
      expect(res.statusCode).toBe(401);
    }
  });

  it('manages election lifecycle, stations, juries, candidates and tally under RLS', async () => {
    if (!postgresAvailable) {
      return;
    }

    const useCase = moduleRef.get(ManageElectionsUseCase);
    const schoolId = 1n;

    const types = await useCase.listCandidacyTypes(schoolId);
    expect(types.length).toBeGreaterThanOrEqual(3);

    const testYear = 2098;
    const election = await useCase.saveElection(schoolId, {
      academicYear: testYear,
      electionName: 'Elección Gobierno Escolar Prueba',
      electionDate: '2098-03-15',
      startTime: '07:00',
      endTime: '15:00',
      allowsBlankVote: true,
      isActive: true,
    });
    expect(election.academicYear).toBe(testYear);

    try {
      const station = await useCase.saveStation(schoolId, BigInt(election.id), {
        stationNumber: 'M-99',
        stationName: 'Mesa Prueba RLS',
        allowedGrades: [1, 2],
      });
      const jury = await useCase.addJury(schoolId, BigInt(station.id), {
        fullName: 'Docente Jurado Prueba',
        roleTitle: 'PRESIDENTE',
      });
      expect(jury.fullName).toBe('Docente Jurado Prueba');

      const candidate = await useCase.saveCandidate(schoolId, BigInt(election.id), {
        candidacyTypeId: types[0].id,
        ballotNumber: '01',
        candidateName: 'Candidato Personería Prueba',
        proposalText: 'Fomentar clubes de robótica y deporte.',
      });
      const blank = await useCase.saveCandidate(schoolId, BigInt(election.id), {
        candidacyTypeId: types[0].id,
        ballotNumber: '00',
        candidateName: 'Voto en Blanco',
        isBlankVoteOption: true,
      });
      expect(candidate.ballotNumber).toBe('01');
      expect(blank.isBlankVoteOption).toBe(true);

      const results = await useCase.getElectionResults(
        schoolId,
        BigInt(election.id),
      );
      expect(results.resultsByCandidacy.length).toBe(1);
      expect(results.resultsByCandidacy[0].candidates.length).toBe(2);
    } finally {
      await useCase.deleteElection(schoolId, BigInt(election.id));
    }
  });
});
