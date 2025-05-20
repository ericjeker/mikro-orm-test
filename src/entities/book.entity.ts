import { Entity, ManyToOne, PrimaryKey, Property } from '@mikro-orm/core'

@Entity({tableName: 'books'})
export class Book {
  @PrimaryKey()
  id!: number;

  @Property()
  title!: string;

  constructor(title: string) {
    this.title = title;
  }
}