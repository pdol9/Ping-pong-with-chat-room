import { CreateDateColumn, DeleteDateColumn, UpdateDateColumn } from 'typeorm';

class Timestamps {
  @CreateDateColumn({
    update: false,
  })
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @DeleteDateColumn({
    update: false,
  })
  deleted_at: Date;
}

export default Timestamps;
