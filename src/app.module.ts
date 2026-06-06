import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { ApartmentModule } from './apartment/apartment.module'
import { AppController } from './app.controller'
import { AppService } from './app.service'
import { AuthModule } from './auth/auth.module'
import { ExpensesModule } from './expenses/expenses.module'
import { UsersModule } from './users/users.module'

@Module({
	imports: [
		ConfigModule.forRoot({
			isGlobal: true
		}),
		AuthModule,
		UsersModule,
		ApartmentModule,
		ExpensesModule
	],
	controllers: [AppController],
	providers: [AppService]
})
export class AppModule {}
