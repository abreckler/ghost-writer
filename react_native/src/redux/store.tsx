import { configureStore } from '@reduxjs/toolkit';

import writerModeConfigsReducer from './slices/writerModConfigSlice';
import stylesReducer from './slices/stylesSlice';

export const store = configureStore({
	reducer: {
		writerModeConfigs: writerModeConfigsReducer,
		styles: stylesReducer,
	}
});

export type RootState = ReturnType<typeof store.getState>;

export type AppDispatch = typeof store.dispatch;