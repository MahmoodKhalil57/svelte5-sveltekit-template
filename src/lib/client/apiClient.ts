import type { apiStructure } from '$api/helpers/apiStructure.server';
import type { API } from '$api/root.server';
import { apiSendBuilder } from '$apiUtils/client/apiClientUtils';
import type {
	APIInput,
	APIOutput,
	Procedures,
	Routes,
	SuccessfullType
} from '$apiUtils/server/ApiUtils.type.server';
import { serverStoreHandle } from '$src/lib/stores/serverStoreHandle';

export const apiSend = (f?: typeof fetch) =>
	apiSendBuilder<typeof apiStructure, typeof API, typeof serverStoreHandle>(f, serverStoreHandle);

export { responseStatus } from '$apiUtils/client/serverResponse';

export type APIOutputType<
	R extends Routes<typeof apiStructure>,
	P extends Procedures<typeof apiStructure, R>
> = APIOutput<R, P, typeof API>;

export type APIInputType<
	R extends Routes<typeof apiStructure>,
	P extends Procedures<typeof apiStructure, R>
> = APIInput<typeof apiStructure, R, P>;

export type SuccessFullApiSend<
	R extends Routes<typeof apiStructure>,
	P extends Procedures<typeof apiStructure, R>
> = SuccessfullType<APIOutputType<R, P>>;
