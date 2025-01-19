<template>
    <div class="signup container mt-5">
        <b-card title="Sign Up" class="w-50 mx-auto">
            <b-form @submit.prevent="onSubmit">
                <b-form-group label="Name" label-for="name">
                    <b-form-input id="name" v-model="name" type="text" placeholder="Enter your name"
                        required></b-form-input>
                </b-form-group>

                <b-form-group label="Email" label-for="email">
                    <b-form-input id="email" v-model="email" type="email" placeholder="Enter your email"
                        required></b-form-input>
                </b-form-group>

                <b-form-group label="Password" label-for="password">
                    <b-form-input id="password" v-model="password" type="password" placeholder="Enter your password"
                        required></b-form-input>
                </b-form-group>

                <b-button type="submit" variant="primary" class="signup w-100">Sign Up</b-button>
            </b-form>
        </b-card>
    </div>
</template>

<script>
import { createUser } from "../api";
import { useAlertStore } from '../store/alert';

export default {
    name: "Signup",
    data() {
        return {
            name: "",
            email: "",
            password: "",
        };
    },
    methods: {
        async onSubmit() {
            const alertStore = useAlertStore();
            try {
                const userData = {
                    name: this.name,
                    email: this.email,
                    password: this.password,
                };

                const response = await createUser(userData);
                console.log("User created:", response);
                // Menampilkan notifikasi sukses menggunakan alert store
                alertStore.showAlert(response.message || "Account created successfully!", false);

                // Redirect to login page or dashboard
                this.$router.push("/login");
            } catch (error) {
                console.error("Signup error:", error);
                // Menampilkan notifikasi error menggunakan alert store
                alertStore.showAlert(
                    error.response?.data?.errors.join(", ") || "Signup failed",
                    true
                );
            }
        },
    },
};
</script>

<style scoped>
.signup {
    margin-top: 30px;
}
</style>