
const initialState = {
    recipes : []
}

function roorReducer (state = initialState, action){
    switch(action.type){
        case 'GET_RECIPES':
            return{
                ...state,
                recipes: action.payload
            }
            default:
                return state;
    }
}

export default rootReducer;