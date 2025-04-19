import bcrypt from 'bcryptjs';

// Hashear password
export const hashPassword = async (password: string) => {
    const salt = await bcrypt.genSalt(10)
    return await bcrypt.hash(password, salt)
}

// Comprobar password
export const checkPassword = async (enteredPassword: string, HashedPassword: string) => {
    
    return await bcrypt.compare(enteredPassword, HashedPassword)
}


