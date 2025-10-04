# Database Subscribers

This directory contains TypeORM entity subscribers for handling database events.

## Example Subscriber

```typescript
import {
  EntitySubscriberInterface,
  EventSubscriber,
  InsertEvent,
} from 'typeorm';
import { UserEntity } from '../entities/user.entity';

@EventSubscriber()
export class UserSubscriber implements EntitySubscriberInterface<UserEntity> {
  listenTo() {
    return UserEntity;
  }

  beforeInsert(event: InsertEvent<UserEntity>) {
    console.log('BEFORE USER INSERTED: ', event.entity);
  }
}
```
