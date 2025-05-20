import { EntityManager, MikroORM } from '@mikro-orm/sqlite';
import { Book } from './entities/book.entity';
import { User } from './entities/user.entity';

export async function bootstrap () {
  const orm = await MikroORM.init({
    entities: ['./dist/entities'], // path to your JS entities (dist), relative to `baseDir`
    entitiesTs: ['./src/**/*.entity.ts'],
    dbName: 'my-db-name',
    debug: true,
    allowGlobalContext: true,
  });

  const em = orm.em as EntityManager;

  const user = new User();
  user.fullName = '<NAME>';
  user.email = '<EMAIL>';
  user.password = '<PASSWORD>';
  em.persist(user); // <- 6. flushed when doing em.findAll(User)

  await em.transactional(async em2 => {
    const book = new Book('My Book');
    em2.persist(book);
    await em2.flush(); // <- 1. flush the book immediately but still inside the transaction

    const user = new User();
    user.fullName = '<INSIDE TRANSACTION>';
    user.email = '<EMAIL>';
    user.password = '<PASSWORD>';
    em.persist(user); // <- 4. I use another EntityManager, but still works inside the transaction

    const qb = em2.createQueryBuilder(Book);
    await qb.delete().where({ id: book.id }).execute(); // <- 2. executed before user insertion

    const qbu = em2.createQueryBuilder(User);
    await qbu.delete().where({ id: user.id }).execute(); // <- 3. user.id is null here
  });

  // Find all books
  const books = await em.findAll(Book);
  console.log(`Books: ${ books.length }`); // <- 5.

  // Find all users
  const users = await em.findAll(User); // <- 7. this flushes the user outside the transactional, but inside its own transaction
  console.log(`Users: ${ users.length }`);
}
