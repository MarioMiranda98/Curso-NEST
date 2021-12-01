import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { EventEntity } from "./events/event.entity";

export enum AttendeeAnswerEnum {
    Accepted = 1,
    Maybe,
    Rejected
}

@Entity()
export class AttendeeEntity {
    @PrimaryGeneratedColumn()
    id: number;
 
    @Column()
    name: string;

    @ManyToOne(() => EventEntity, (event) => event.attendees, { nullable: false })     
    event: EventEntity

    @Column({
        enum: AttendeeAnswerEnum,
        default: AttendeeAnswerEnum.Accepted
    })
    answer: AttendeeAnswerEnum;
}