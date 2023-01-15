import { SetMetadata } from "@nestjs/common";
import { IS_PUBLIC_METADATA_KEY } from "auth/const/auth.const";

export const Public = () => SetMetadata(IS_PUBLIC_METADATA_KEY, true);
