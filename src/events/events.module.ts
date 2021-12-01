import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AttendeeEntity } from 'src/attendee.entity';
import { EventEntity } from './event.entity';
import { EventsController } from './events.controller';
import { EventsService } from './events.service';

@Module({
    imports: [
        TypeOrmModule.forFeature([EventEntity, AttendeeEntity]),
    ],
    controllers: [EventsController],
    providers: [EventsService]
})
export class EventsModule {

}
