import { supabaseBrowser } from "./supabaseClient";

/**
 * Ensures a user profile exists, creates one if it doesn't
 * @param {string} userId - The user's ID
 * @param {string} name - The user's name
 * @param {string} avatarUrl - The user's avatar URL (optional)
 * @returns {Promise<Object|null>} The profile data or null if failed
 */
export async function ensureProfileExists(userId, name, avatarUrl = null) {
  if (!userId || !name) return null;

  try {
    // First, try to get existing profile
    const { data: existingProfile, error: fetchError } = await supabaseBrowser
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();

    if (existingProfile) {
      return existingProfile;
    }

    // If no profile exists, create one
    const { data: newProfile, error: insertError } = await supabaseBrowser
      .from("profiles")
      .insert({
        id: userId,
        name: name,
        avatar_url: avatarUrl,
      })
      .select()
      .single();

    if (insertError) {
      console.error("Error creating profile:", insertError);
      return null;
    }

    return newProfile;
  } catch (error) {
    console.error("Error ensuring profile exists:", error);
    return null;
  }
}

/**
 * Updates a user's profile
 * @param {string} userId - The user's ID
 * @param {Object} updates - The profile updates
 * @returns {Promise<Object|null>} The updated profile or null if failed
 */
export async function updateProfile(userId, updates) {
  if (!userId || !updates) return null;

  try {
    const { data: updatedProfile, error } = await supabaseBrowser
      .from("profiles")
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq("id", userId)
      .select()
      .single();

    if (error) {
      console.error("Error updating profile:", error);
      return null;
    }

    return updatedProfile;
  } catch (error) {
    console.error("Error updating profile:", error);
    return null;
  }
}
