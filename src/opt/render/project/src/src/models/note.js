const mongoose = require('mongoose');

const NoteSchema = new mongoose.Schema({
  eleve: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Eleve', 
    required: true 
  },
  cours: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Cours', 
    required: true 
  },
  anneeScolaire: { type: String, required: true },
  semestre: { type: Number, required: true, min: 1, max: 2 },
  evaluations: [{
    typeEvaluation: { 
      type: String, 
      enum: ['devoir', 'examen', 'projet', 'participation'] 
    },
    note: { type: Number, min: 0, max: 20 },
    coefficient: { type: Number, default: 1 },
    date: { type: Date, default: Date.now },
    commentaire: String
  }],
  moyenne: { type: Number, min: 0, max: 20 },
  appreciation: String,
  enregistrePar: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  }
}, { timestamps: true });

// Calcul de la moyenne avant sauvegarde
NoteSchema.pre('save', function(next) {
  if (this.evaluations && this.evaluations.length > 0) {
    const total = this.evaluations.reduce((sum, eval) => {
      return sum + (eval.note * eval.coefficient);
    }, 0);
    
    const totalCoeff = this.evaluations.reduce((sum, eval) => {
      return sum + eval.coefficient;
    }, 0);
    
    this.moyenne = total / totalCoeff;
  }
  next();
});

module.exports = mongoose.model('Note', NoteSchema);