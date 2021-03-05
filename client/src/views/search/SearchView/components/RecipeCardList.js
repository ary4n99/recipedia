import React from "react";
import PropTypes from "prop-types";
import RecipeCard from "src/views/search/SearchView/components/RecipeCard";
import { Grid } from "@material-ui/core";
import LinearProgress from "@material-ui/core/LinearProgress";

const RecipeCardList = ({ recipes, onRecipeClick, loading }) => {
  return (
    <Grid container spacing={2}>
      {recipes.map((recipeItem) => (
        <Grid item xs={12} sm={6} md={4} lg={3} xl={2}>
          <RecipeCard recipe={recipeItem} onClick={onRecipeClick} />
        </Grid>
      ))}
      <Grid item xs={12}>
        {loading ? <LinearProgress /> : null}
      </Grid>
    </Grid>
  );
};

RecipeCardList.propTypes = {
  recipes: PropTypes.array.isRequired,
  onRecipeClick: PropTypes.func.isRequired,
  loading: PropTypes.bool,
};

export default RecipeCardList;
