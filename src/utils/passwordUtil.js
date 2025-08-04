import bcrypt from 'bcrypt';

export const createHash = (password) => {
    return bcrypt.hashSync(password, bcrypt.genSaltSync(10));
};

export const isValidPassword = (user, password) => {
   
    console.log('Validando contraseña:');
    console.log('Contraseña proporcionada:', password);
    console.log('Contraseña en la DB:', user.password);

    const match = bcrypt.compareSync(password, user.password);
    console.log('Coincidencia:', match);

    return match;
};