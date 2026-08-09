export default {
    name: "AlertCard",

    props: {
        alert: {
            type: Object,
            required: true
        }
    },

    computed: {

        hasIcon() {
            return !!this.alert?.icon;
        },

        hasTitle() {
            return !!this.alert?.title;
        },

        hasMessage() {
            return !!this.alert?.message;
        }

    }
};