<template>
    <div>
        <v-container fluid>
            <v-img v-if="event" max-height="611" max-width="610"
                src="https://media.discordapp.net/attachments/1027432538676928532/1049337934043684954/image.png?width=810&height=703">
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
        event: false,
    }),
    created() {
        const currentYear = (new Date()).getFullYear()
        const currentMonth = (new Date()).getMonth() + 1
        const currentDate = (new Date()).getDate()
        if (currentYear === 2022 && currentMonth === 12) {
            if (currentDate >= 5 && currentDate <= 6) {
                this.event = true
            }
        }
    },
}
</script>