import * as AuthService from './auth/index';
import * as UserService from './users';

/**
 * Agrupamos todos los servicios en un solo objeto de exportación.
 * Esto permite el uso de UserService.AuthService.register() 
 * como se definió en el controlador.
 */
const services = {
    AuthService,
    UserService
};

export {
    AuthService,
    UserService
};

export default services;