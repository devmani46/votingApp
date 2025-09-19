// import { HttpInterceptorFn } from '@angular/common/http';
// import { inject } from '@angular/core';
// import { Router } from '@angular/router';
// import { AuthService } from './auth';
// import { catchError } from 'rxjs/operators';
// import { throwError } from 'rxjs';

// export const authInterceptor: HttpInterceptorFn = (req, next) => {
//   const auth = inject(AuthService);
//   const router = inject(Router);

//   const token = auth.getToken();

//   const authReq = token
//     ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } })
//     : req;

//   return next(authReq).pipe(
//     catchError((err) => {
//       if (err.status === 401) {
//         auth.logout();
//         router.navigate(['/login']);
//       }
//       return throwError(() => err);
//     })
//   );
// };
