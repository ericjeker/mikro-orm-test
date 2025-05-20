import { EntityManager, MikroORM } from '@mikro-orm/sqlite'
import { Book } from './entities/book.entity'
import { User } from './entities/user.entity'

export async function bootstrap() {
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
  em.persist(user); // <- flushed when doing em.findAll(User)

  await em.transactional(async em2 => {
    const book = new Book('My Book');
    em2.persist(book); // <- flushed at the end of the transaction
    await em2.flush();

    const user = new User();
    user.fullName = '<INSIDE TRANSACTION>';
    user.email = '<EMAIL>';
    user.password = '<PASSWORD>';
    em.persist(user);

    const qb = em2.createQueryBuilder(Book);
    await qb.delete().where({ id: book.id }).execute();
  });

  // Find all books
  const books = await em.findAll(Book);
  console.log(`Books: ${books.length}`);

  // Find all users
  const users = await em.findAll(User);
  console.log(`Users: ${users.length}`);
}
