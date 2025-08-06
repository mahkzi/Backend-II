class UserDTO {
     constructor(user) {
        console.log('UserDTO: Objeto de usuario entrante:', user); 
        this.id = user._id ? user._id.toString() || user.id : null; 
        this.first_name = user.first_name;
        this.last_name = user.last_name;
        this.email = user.email;
        this.age = user.age;
        this.role = user.role;
        this.cart = user.cart ? user.cart.toString() : null;
        console.log('UserDTO: Objeto creado para el payload:', this); 
    }
}

export default UserDTO;