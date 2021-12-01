import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { AttendeeAnswerEnum } from "src/attendee.entity";
import { User } from "src/auth/user.entity";
import { CreateEventDTO } from "src/create-event.dto";
import { paginate, PaginateOptions } from "src/pagination/paginator";
import { UpdateEventDTO } from "src/update-event.dto";
import { Repository } from "typeorm";
import { EventEntity } from "./event.entity";
import { ListEvents, WhenEventFilter } from "./input/list.events";

@Injectable()
export class EventsService {
    constructor(
        @InjectRepository(EventEntity)
        private readonly eventsRepository: Repository<EventEntity>
    ){}

    private getEventsBaseQuery() {
        return this.eventsRepository
            .createQueryBuilder('e')
            .orderBy('e.id', 'DESC');
    }

    public getEventsWithAttendeeCountQuery() {
        return this.getEventsBaseQuery()
            .loadRelationCountAndMap(
                'e.attendeeCount', 'e.attendees'
            )
            .loadRelationCountAndMap(
                'e.attendeeMaybe',
                'e.attendees',
                'attendee',
                (qb) => qb
                    .where('attendee.answer = :answer', 
                    { answer: AttendeeAnswerEnum.Maybe })
            )
            .loadRelationCountAndMap(
                'e.attendeeAccepted',
                'e.attendees',
                'attendee',
                (qb) => qb
                    .where('attendee.answer = :answer', 
                    { answer: AttendeeAnswerEnum.Accepted })
            ).loadRelationCountAndMap(
                'e.attendeeRejected',
                'e.attendees',
                'attendee',
                (qb) => qb
                    .where('attendee.answer = :answer', 
                    { answer: AttendeeAnswerEnum.Rejected })
            );
    }

    public async getEventsWithAttendeeCountFilteredPaginated(
        filter: ListEvents,
        paginateOptions: PaginateOptions
      ) {
        return await paginate(
          await this.getEventsWithAttendeeCountFiltered(filter),
          paginateOptions
        );
      }

    private async getEventsWithAttendeeCountFiltered(
        filter?: ListEvents
    ) {
        let query = this.getEventsWithAttendeeCountQuery();
    
        if (!filter) {
          return query;
        }
    
        if (filter.when) {
          if (filter.when == WhenEventFilter.Today) {
            query = query.andWhere(
              `e.when >= CURDATE() AND e.when <= CURDATE() + INTERVAL 1 DAY`
            );
          }
    
          if (filter.when == WhenEventFilter.Tommorow) {
            query = query.andWhere(
              `e.when >= CURDATE() + INTERVAL 1 DAY AND e.when <= CURDATE() + INTERVAL 2 DAY`
            );
          }
    
          if (filter.when == WhenEventFilter.ThisWeek) {
            query = query.andWhere('YEARWEEK(e.when, 1) = YEARWEEK(CURDATE(), 1)');
          }
    
          if (filter.when == WhenEventFilter.NextWeek) {
            query = query.andWhere('YEARWEEK(e.when, 1) = YEARWEEK(CURDATE(), 1) + 1');
          }
        }
    
      return query;
    }

    public async getEvent(id: number): Promise<EventEntity> {
        return await this.getEventsBaseQuery()
            .andWhere('e.id = :id', { id: id })
            .getOne();
    }

    public async deleteEvent(id: number) {
      return await this.eventsRepository
        .createQueryBuilder('e')
        .delete()
        .where('id = :id', { id })
        .execute();
    }

    public async createEvent(input: CreateEventDTO, user: User): Promise<EventEntity> {
      return await this.eventsRepository.save({
        ...input,
        organizer: user,
        when: new Date(input.when)
      });
    }

    public async updateEvent(event: EventEntity, input: UpdateEventDTO): Promise<EventEntity> {
      return await this.eventsRepository.save({
        ...event,
        ...input,
        when: input.when ? new Date(input.when) : event.when
      });
    }
}