import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity()

export class User {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    name: string;

    @Column()
    age: number;

    @Column()
    email: string;

    @Column({nullable: true})
    password: string;

    @Column({nullable: true, unique: true})
    googleId: string;

    //SUBSCRIPTIONS, ROLES, ETC CAN BE ADDED HERE
    @Column({default: false})
    isSubscribed: boolean;

    @Column({type: 'datetime', nullable: true})
    subscriptionExpiresAt: Date | null;
}