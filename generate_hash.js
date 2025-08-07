import bcrypt from 'bcryptjs';
const plaintextPassword = 'admin';
const saltRounds = 10; 

bcrypt.hash(plaintextPassword, saltRounds, function(err, hash) {
    if (err) {
        console.error("Erro ao gerar hash da senha:", err);
    } else {
        console.log("Hash da Senha:", hash);
    }
});