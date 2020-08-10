import Vue from "vue";
import axios from "axios";
import VueSweetalert2 from "vue-sweetalert2";
import router from "./router";
import store from "./store/store";
import App from "./App";
import Auth from "./plugins/auth";
import Toast from "./plugins/toast";
import Api from "./plugins/api";


Vue.prototype.$http = axios;
// Vue.use(Vuelidate);
const swalOptions = {
    confirmButtonClass: "sano-btn border-sano-red-orange bg-sano-red-orange text-white",
    cancelButtonClass: "sano-btn border-sano-blue bg-sano-blue text-white",
    customClass: "sano-modal",
    buttonsStyling: false,
    reverseButtons: true,
};

Vue.use(VueSweetalert2, swalOptions);


Vue.use(Auth);
Vue.use(Toast);
Vue.use(Api);

Vue.config.productionTip = false;
Vue.prototype.location = window.location;


// Response interceptor
axios.interceptors.response.use(
    function (response) {
        Vue.auth.setToken(response.headers.token);
        return response;
    },
    /* eslint-disable */
    function (error) {
        if (error.response) {
            switch (error.response.status) {
			case 409:
				break; // resource already exists during a create
            case 400:
				if (error.response.data.error) {
					Vue.toast({ type: "error", title: error.response.data.error });
				} else {
					Vue.toast({ type: "error", title: "Server error unspecified" });
				}
				break;
			case 422:
				Vue.toast({ type: "error", title: "Invalid parameters sent to endpoint" });
				break;
			case 429:
				Vue.toast({ type: "error", title: "Too many attempts. Please wait 1 minute and try again" });
				break;
			case 401:
				Vue.auth.destroyToken();
				Vue.toast({ type: "error", title: error.response.data.error });
				router.push("/login");
				break;
			case 404:
				Vue.toast({ type: "error", title: error.response.data.error });
				router.push("/notfound");
				break;
			case 405:
				Vue.toast({ type: "error", title: "API end point does not exist" });
				break;
			default:
				Vue.toast({ type: "error", title: `Unrecognised response code ${error.response.status}` });
            }
        } else {
            Vue.toast({ type: "error", title: "Network Error" });
        }
        return Promise.reject(error);
	}
	/* eslint-enable */
);

function isMobileDevice() {
    return typeof window.orientation !== "undefined" || navigator.userAgent.indexOf("IEMobile") !== -1;
}

// Route Guards
router.beforeEach(function (to, from, next) {

    if (to.meta.title) {
        document.title = `${to.meta.title} | Sano Genetics`;
    } else {
        document.title = "Sano";
    }

    if (Vue.auth.needsRefresh()) {
        axios
            .get("/x/refresh")
            .then((response) => {})
            .catch((error) => {}); // refresh
    }

    if (
        to.matched.some(function (record) {
            return record.meta.requiresGuest;
        }) &&
        Vue.auth.loggedIn()
    ) {
        // prevent access to 'requiresGuest' routes from logged in users
        next({
            path: "/research",
        });
    } else if (
        to.matched.some(function (record) {
            return record.meta.requiresAuth;
        }) &&
        !Vue.auth.loggedIn()
    ) {
        // prevent access to 'requiresAuth' routes from logged out users
        Vue.toast({ type: "info", title: "Please log in first" });
        next({
            path: "/login",
            query: { redirect: to.fullPath },
        });
    } else {
        next();
    }
});

new Vue({
    router,
    store,
    render: (h) => h(App),
}).$mount("#app");

// on hot-reload clear the console
window.addEventListener("message", (e) => {
    if (e.data && typeof e.data === "string" && e.data.match(/webpackHotUpdate/)) {
        console.clear();
    }
});