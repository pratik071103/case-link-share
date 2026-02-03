/// <reference types="https://esm.sh/@supabase/functions-js/src/edge-runtime.d.ts" />

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface Activity {
  _id: { $oid: string } | string;
  key: string;
  name: string;
  activity_type: string;
  objective: string;
  instructions: string;
  materials: string;
  level: number;
  level_score: number;
  fTarget: string;
  fTargetValue: string | number;
  iTarget: string;
  iTargetValue: string | number;
  sTarget: string;
  sTargetValue: string | number;
  skill: { name: string };
  indicator: { name?: string; _id?: { $oid: string } };
}

interface ApiResponse {
  status: number;
  data: {
    activities: Activity[];
    user: {
      name: string;
      parentName: string;
      ageGroup: string;
      gender: string;
    };
  };
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { email } = await req.json();

    if (!email) {
      return new Response(
        JSON.stringify({ error: 'Email is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Fetching assessment for email: ${email}`);

    // Create form data
    const formData = new FormData();
    formData.append('email', email);

    // Call external API
    const response = await fetch('https://api.arrc.one/service/loadUserAssessment', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      console.error(`API returned status: ${response.status}`);
      return new Response(
        JSON.stringify({ error: 'Failed to fetch assessment data' }),
        { status: response.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const data: ApiResponse = await response.json();
    console.log(`Received ${data.data?.activities?.length || 0} activities`);

    // Filter activities to only "expert activity" type
    const expertActivities = (data.data?.activities || []).filter(
      (activity: Activity) => activity.activity_type === 'expert activity'
    );

    console.log(`Filtered to ${expertActivities.length} expert activities`);

    // Process and group by skill
    const skillsMap = new Map<string, {
      skillName: string;
      indicators: Map<string, {
        indicatorName: string;
        activities: Activity[];
      }>;
    }>();

    expertActivities.forEach((activity: Activity) => {
      const skillName = activity.skill?.name || 'Unknown Skill';
      const indicatorName = activity.indicator?.name || '';

      if (!skillsMap.has(skillName)) {
        skillsMap.set(skillName, {
          skillName,
          indicators: new Map(),
        });
      }

      const skill = skillsMap.get(skillName)!;
      
      if (!skill.indicators.has(indicatorName)) {
        skill.indicators.set(indicatorName, {
          indicatorName,
          activities: [],
        });
      }

      skill.indicators.get(indicatorName)!.activities.push(activity);
    });

    // Convert to serializable format
    const skills = Array.from(skillsMap.values()).map(skill => ({
      skillName: skill.skillName,
      indicators: Array.from(skill.indicators.values()).map(ind => ({
        indicatorName: ind.indicatorName,
        activities: ind.activities.map(act => ({
          key: act.key,
          name: act.name,
          objective: act.objective || '',
          instructions: act.instructions || '',
          materials: act.materials || '',
          level: act.level || 0,
          levelScore: act.level_score || 0,
          fTarget: act.fTarget || '',
          fTargetValue: parseFloat(String(act.fTargetValue)) || 0,
          iTarget: act.iTarget || '',
          iTargetValue: parseFloat(String(act.iTargetValue)) || 0,
          sTarget: act.sTarget || '',
          sTargetValue: parseFloat(String(act.sTargetValue)) || 0,
        })),
      })),
    }));

    return new Response(
      JSON.stringify({
        success: true,
        user: data.data?.user,
        skills,
        rawActivitiesCount: data.data?.activities?.length || 0,
        expertActivitiesCount: expertActivities.length,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (err) {
    const error = err as Error;
    console.error('Error in load-user-assessment:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
