import { createRouter, createWebHistory } from "vue-router";
import AccountView from "./views/AccountView.vue";
import AuthView from "./views/AuthView.vue";
import CredentialsView from "./views/CredentialsView.vue";

export const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: "/",
      redirect: "/credentials",
    },
    {
      path: "/login",
      component: AuthView,
    },
    {
      path: "/register",
      component: AuthView,
    },
    {
      path: "/credentials",
      component: CredentialsView,
    },
    {
      path: "/account",
      component: AccountView,
    },
  ],
});
