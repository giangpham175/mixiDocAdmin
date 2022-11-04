<template>
    <div>
        <v-container fluid>
            <v-img v-if="birthday" max-height="611" max-width="610"
                src="https://media.discordapp.net/attachments/1038006225230626856/1038010817775411220/hpbd.png?width=799&height=1222">
            </v-img>
            <v-img v-else max-height="611" max-width="610"
                src="https://media.discordapp.net/attachments/977950271663644712/1011922943497994341/2.png?width=810&height=811">
            </v-img>
        </v-container>
    </div>
</template>

<script>
export default {
    data: () => ({
        birthday: false,
    }),
    created() {
        const currentYear = (new Date()).getFullYear()
        const currentMonth = (new Date()).getMonth() + 1
        const currentDate = (new Date()).getDate()
        if (currentYear === 2022 && currentMonth === 11) {
            if (currentDate >= 4 && currentDate <= 6) {
                this.birthday = true
            }
        }
    },
}
</script>