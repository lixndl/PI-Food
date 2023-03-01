import React from 'react';
import {useState, useEffect} from 'react';
import  {useDispatch, useSelector} from 'react-redux'
import { getRecipes } from '../actions';
import {Link} from 'react-router-dom';
import Card from './Card';

export default function Home (){

const dispatch = useDispatch()
const allRecipes = useSelector ((state) => state.recipes)

useEffect (()=>{
    dispatch(getRecipes());
},[dispatch])

function handleClick(e){
    e.preventDefault();
    dispatch(getRecipes());
}

return (
    <div>
        <Link to = '/recipes'>Crear receta</Link>
        <h1>aguante recetaas</h1>
        <button onClick={e=> {handleClick(e)}}>
            Volver a cargar todas las recetas
        </button>
        <div>
            <select>
                <option value= 'asc'>Ascendente</option>
                <option value= 'des'>Descendente</option>
            </select>
            <select>
                <option value='All'>Todos</option>
                <option value='Alive'>Vivo</option>
                <option value='Deceased'>Muerto</option>
                <option value='Unknow'>Desconocido</option>
                <option value='Presumed dead'>Probablemente muerto</option>
            </select>
            <select>
                <option value= 'All'>Todos</option>
                <option value= 'Created'>Creados</option>
                <option value= 'api'>Existentes</option>
            </select>
        {allRecipes?.map((c) => {
            return (
                <fragment>
                    <Link to = {"/Home/" + c.id}>
                        <Card name={c.name} image={c.img} typeDiet={c.typeDiet} key= {c.id}/>
                    </Link>
                </fragment>
            )
        })}
        </div>
    </div>
)

}