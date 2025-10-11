
import { getAuthSession } from "@/lib/auth";
import { AuthenticatedHome } from "@/components/authenticated-home";
import { UnauthenticatedHome } from "@/components/unauthenticated-home";

export default async function HomePage() {
  const session = await getAuthSession();

  if (session?.user) {
    return <AuthenticatedHome user={session.user as any} />;
  }

  return <UnauthenticatedHome />;
}
