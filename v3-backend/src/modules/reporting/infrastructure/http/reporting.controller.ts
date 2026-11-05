import { InjectQueue } from '@nestjs/bullmq';
import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { Queue } from 'bullmq';
import { GenerateJasperReportInput } from '../../../../shared/application/ports/report-generator.port';
import { JASPER_REPORTS_QUEUE } from '../queues/jasper-report.processor';

@Controller('reports')
export class ReportingController {
  constructor(
    @InjectQueue(JASPER_REPORTS_QUEUE)
    private readonly reportsQueue: Queue,
  ) {}

  @Post('enqueue')
  async enqueueReport(
    @Body() body: GenerateJasperReportInput,
  ): Promise<Record<string, unknown>> {
    const job = await this.reportsQueue.add('generate-jasper-report', body, {
      removeOnComplete: 100,
      removeOnFail: 200,
      attempts: 2,
    });

    return {
      success: true,
      jobId: job.id,
      queue: JASPER_REPORTS_QUEUE,
      status: 'QUEUED',
    };
  }

  @Get('jobs/:jobId')
  async getJobStatus(
    @Param('jobId') jobId: string,
  ): Promise<Record<string, unknown>> {
    const job = await this.reportsQueue.getJob(jobId);
    if (!job) {
      return {
        success: false,
        status: 'NOT_FOUND',
      };
    }

    const state = await job.getState();
    return {
      success: true,
      jobId: job.id,
      state,
      result: job.returnvalue ?? null,
    };
  }
}
