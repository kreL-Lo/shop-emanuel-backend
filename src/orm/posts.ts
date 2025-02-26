import { Model } from "objection";
import knex from "../dbSetup/dbSetup";

// knex

Model.knex(knex);
class Posts extends Model {
  static get tableName() {
    return "wp_posts";
  }
}

export default Posts;