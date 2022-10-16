import { firestore } from 'firebase';

const collName = 'AllStatus';

const allstatus = {
    namespaced: true,
    state: {
        allstatus: [],
    },
    getters: {
        getAllStatus: (state) => {
            return state.allstatus;
        }
    },
    mutations: {
        SET_ALLSTATUS(state, allstatus) {
            state.allstatus = allstatus;
        },
        UPDATE_STATUS(state, payload) {
            Object.assign(state.allstatus[payload.index], payload.status);
        },
    },
    actions: {
        async loadAllStatus({commit}) {
            const querySnapshot = await firestore().collection(collName).get();
            let status;
            let allstatus = querySnapshot.docs.map(function (doc) {
                status = doc.data();
                status.id = doc.id;
                return status;
            });
            commit('SET_ALLSTATUS', allstatus);
        },
        async updateStatus({commit}, payload) {
            await firestore().collection(collName).doc(payload.status.id).set(payload.status);
            commit('UPDATE_STATUS', payload);
        },
    }
}

export default allstatus;