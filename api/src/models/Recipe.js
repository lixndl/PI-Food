const { DataTypes } = require('sequelize');
// Exportamos una funcion que define el modelo
// Luego le injectamos la conexion a sequelize.
module.exports = (sequelize) => {
  // defino el modelo
  sequelize.define('recipe', {
    id:{
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      allowNull: false, //seteado en false, no permite que este vacio. 
      primaryKey: true  //Será la clave primaria
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    image:{
      type: DataTypes.STRING,
      allowNull: false,
    },
    summary:{
      type : DataTypes.TEXT,
      allowNull: false,
    },
    healthScore:{
      type: DataTypes.STRING,
      allowNull: false,
    },
    analyzedInstructions:{
      type : DataTypes.TEXT,
      allowNull: false,
    },
    createdInDb:{
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true
    }
  });
};




