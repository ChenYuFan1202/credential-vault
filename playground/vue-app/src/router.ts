import { createRouter, createWebHistory } from "vue-router";
import CredentialListView from './views/CredentialListView.vue';
import NewCredentialView from './views/NewCredentialView.vue';

const router = createRouter({
    history: createWebHistory(),
    routes: [
      {
        path: "/",
        name: "credentials",
        component: CredentialListView,
      },
      {
        path: "/new",
        name: "new-credential",
        component: NewCredentialView,
      },
    ],
});

export default router;