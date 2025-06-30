import bcrypt from 'bcrypt';
const plaintextPassword = 'Make784512';
const saltRounds = 10; // Um valor recomendado para segurança

bcrypt.hash(plaintextPassword, saltRounds, function(err, hash) {
    if (err) {
        console.error("Erro ao gerar hash da senha:", err);
    } else {
        console.log("Hash da Senha:", hash);
    }
});