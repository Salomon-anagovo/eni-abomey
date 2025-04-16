const mongoose = require('mongoose');
const chalk = require('chalk');
const { MongoMemoryServer } = require('mongodb-memory-server');

// Configuration optimisée de la connexion MongoDB
const connectDB = async () => {
  try {
    let mongoUri = process.env.MONGO_URI || 
      "mongodb+srv://eni_user:Barack122021@cluster0.gbiilyl.mongodb.net/EleveInstituteur?retryWrites=true&w=majority";

    // Utilisation de MongoDB en mémoire pour les tests
    if (process.env.NODE_ENV === 'test') {
      const mongoServer = await MongoMemoryServer.create();
      mongoUri = mongoServer.getUri();
    }

    // Options de connexion avancées
    const options = {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000,
      maxPoolSize: 50,
      socketTimeoutMS: 45000,
      family: 4,
      retryWrites: true,
      w: 'majority'
    };

    // Événements de connexion
    mongoose.connection.on('connecting', () => {
      console.log(chalk.yellow('🔄 Connexion à MongoDB en cours...'));
    });

    mongoose.connection.on('connected', () => {
      console.log(chalk.green(`✅ MongoDB connecté sur ${getCleanUri(mongoUri)}`));
    });

    mongoose.connection.on('error', (err) => {
      console.error(chalk.red(`❌ Erreur MongoDB: ${err.message}`));
    });

    mongoose.connection.on('disconnected', () => {
      console.log(chalk.yellow('⚠️  MongoDB déconnecté'));
    });

    // Connexion principale
    await mongoose.connect(mongoUri, options);

    // Mode debug si nécessaire
    if (process.env.MONGO_DEBUG === 'true') {
      mongoose.set('debug', (collectionName, method, query, doc) => {
        console.log(chalk.blue(`MongoDB: ${collectionName}.${method}`, {
          query: JSON.stringify(query),
          doc: JSON.stringify(doc)
        }));
      });
    }

  } catch (err) {
    console.error(chalk.red(`❌ Échec de connexion MongoDB: ${err.message}`));
    process.exit(1);
  }
};

// Masquer les informations sensibles dans les logs
function getCleanUri(uri) {
  return uri.replace(/\/\/[^@]+@/, '//***:***@');
}

// Gestion de la déconnexion propre
async function closeDB() {
  try {
    await mongoose.connection.close();
    console.log(chalk.yellow('🔌 Connexion MongoDB fermée'));
  } catch (err) {
    console.error(chalk.red(`❌ Erreur lors de la fermeture MongoDB: ${err.message}`));
  }
}

// Gestion des signaux d'arrêt
process.on('SIGINT', async () => {
  await closeDB();
  process.exit(0);
});

module.exports = { connectDB, closeDB };