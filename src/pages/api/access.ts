import type { APIRoute } from 'astro';

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
  try {
    const contentType = request.headers.get('content-type') || '';
    let email = '';
    let name = '';
    let organization = '';
    let useCase = '';

    if (contentType.includes('application/json')) {
      const data = await request.json();
      email = data.email?.trim() || '';
      name = data.name?.trim() || '';
      organization = data.organization?.trim() || '';
      useCase = data.useCase?.trim() || '';
    } else {
      const formData = await request.formData();
      email = (formData.get('email') as string)?.trim() || '';
      name = (formData.get('name') as string)?.trim() || '';
      organization = (formData.get('organization') as string)?.trim() || '';
      useCase = (formData.get('useCase') as string)?.trim() || '';
    }

    if (!email || !email.includes('@')) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Please provide a valid email address.',
        }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    // Capture edge metadata from Cloudflare headers
    const country = request.headers.get('cf-ipcountry') || 'Unknown';
    const ray = request.headers.get('cf-ray') || 'Local';
    const timestamp = new Date().toISOString();

    // In a production setup, this would persist to Cloudflare D1/KV or trigger a PostHog server event
    return new Response(
      JSON.stringify({
        success: true,
        message: 'Your early access request has been recorded. Our research team will reach out shortly.',
        data: {
          email,
          name,
          organization,
          useCase,
          edgeLocation: country,
          edgeRay: ray,
          timestamp,
        },
      }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-store',
        },
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Internal Server Error',
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
};
