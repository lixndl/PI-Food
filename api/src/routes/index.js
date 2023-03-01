const { Router } = require('express');
// Importar todos los routers;
// Ejemplo: const authRouter = require('./auth.js');
const axios = require('axios');
const {Recipe, TypeDiet} = require('../db');
const {API_KEY} = process.env;
const router = Router();

// Configurar los routers
// Ejemplo: router.use('/auth', authRouter);

const getApiInfo = async () => {    //Llama al endPoint de la api y trae toda la info. que voy a necesitar.
    const apiUrl = await axios.get(`https://api.spoonacular.com/recipes/complexSearch?apiKey=${API_KEY}&addRecipeInformation=true&number=100`);   //El async-await le avisa que debe aguardar a la respuesta np,m
    const apiInfo = await apiUrl.data.results.map(el => {
        return {
            id : el.id,
            name : el.name,
            image : el.image,
            typeDiets: el.diets.map((d) => {return {name:d}}), //array con distintos tipos de dietas de la receta solicitada.
            dishTypes: el.dishTypes.map((d) => {return{name:d}}),
            summary : el.summary,
            healthScore : el.healthScore,
            analyzedInstructions : el.analyzedInstructions
        };
    });
    return apiInfo;   //Esta funcion me trae la info. de la API.
};

const getDbInfo = async () => {
    return await Recipe.findAll({
        include:{
            model: TypeDiet,
            attributes: ['name'],
            throught: {
                attributes: [],
            },
        }
    })
}  //Esta funcion me trae la info. de la base de datos

const getAllRecipes = async () => {
    const apiInfo = await getApiInfo();
    const dbInfo = await getDbInfo();
    const infoTotal = apiInfo.concat(dbInfo);
    return infoTotal 
}

const getAllDiets = async () => {
    try{
        const findDiets = await TypeDiet.findAll();
        if(!findDiets.length) {
            const allDiets = await axios (`https://api.spoonacular.com/recipes/complexSearch?apiKey=${API_KEY}&addRecipeInformation=true&number=40`);

        const result = allDiets.data.results.map((el) => {
            return el.diets
        })

        const allPromise = await Promise.all(result);

        let repeatedDiets = allPromise.flat();
        const repeatedDietsArr = new Set(repeatedDiets)
        let diets = [...repeatedDietsArr];

        const dietObj = diets.map(el => {
            return {name: el}
        })

        const createDiets = await TypeDiet.bulkCreate(dietObj);

        return createDiets;

    }

    return findDiets;
} catch (err) {
    return 'No hay dietas'
}
}

const postRecipe = async (
        name,
        image,
        summary,
        healthScore,
        diets,
        analyzedInstructions 
) => {
    try {
        const newRecipe = await Recipe.create({
            name,
            image,
            summary,
            healthScore,
            analyzedInstructions 
        });

    const response = await axios("http://localhost:3001/diets");
    const result = response.data;
    const dietsId = diets.map((el) => 
        result.map((elAxios) => {
            if(el === elAxios.name){
                return elAxios.id;
            }
        }));

        const dietsIdFlat = dietsId.flat();
        const dietsIdClean = dietsIdFlat.filter((el) => el !== undefined);

        await newRecipe.addDiets(dietsIdClean);

        return newRecipe;
    } catch (err) {
        return "No es posible crear esta receta"
    }
}


router.get('/recipes', async (req, res) =>{
    const name = req.query.name
    const recipesTotal = await getAllRecipes();
    if(name){
        let recipeName = await recipesTotal.filter(el => el.name.toLowerCase().includes(name.toLowerCase()))  //El toLowerCase pasa todos los nombres a minuscula.
        recipeName.length ?
        res.status(200).send(recipeName) :
        res.status(404).send('No se encuentra la receta solicitada');
    } else {
        res.status(200).send(recipesTotal)
    }
})

router.get('/diets', async (req, res) => {
    try {
        const allDiets = await getAllDiets();
        res.status(200).json(allDiets)
    } catch (err) {
        res.status(404).json({error: err.message})
    }
})

router.post('/recipes', async (req, res) => {
    const { name, image, summary, healthScore, analyzedInstructions, diets } = req.body;
    if((!name || !image || !summary || !healthScore || !analyzedInstructions || !diets)) throw Error('Faltan datos para crear la receta')
        try {
            const newRecipe = await postRecipe(
                name,
                image,
                summary,
                healthScore,
                diets,
                analyzedInstructions 
            );

            res.status(201).json(newRecipe);
        } catch (err) {
            res.status(404).json({ error: err.message });
        }
})

// router.post('/recipes', async (req, res) => {
//     let {
//         name,
//         image,
//         typeDiet,
//         summary,
//         healthScore,
//         createdInDb,
//         analyzedInstructions 
//     } = req.body

//     let recipeCreated = await Recipe.create({
//         name,
//         image,
//         summary,
//         healthScore,
//         createdInDb,
//         analyzedInstructions 
//     })

//     let typeDietDb = await TypeDiet.findAll({
//         where: { name: typeDiet }
//     })
//     recipeCreated.addTypeDiet(typeDietDb)
//     res.send('Receta creada con exito')
// })

router.get('/recipes/:idRecipe', async (req, res) => {
    const id = req.params.id;
    const recipesTotal = await getAllRecipes()
    if(id){
        let recipeId = await recipesTotal.filter( el => el.id == id)
        recipeId.length?
        res.status(200).json(recipeId) : 
        res.status(404).send('No encontré esa receta')
    }
})



module.exports = router;
