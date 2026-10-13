import type { Recipe } from '../domain/schema'
import { Mark } from './BrewerArt'

/**
 * The recipe's portrait, cropped to fill whatever box the caller gives it.
 * A recipe without one gets its Brewer drawn on a tinted tile with the orange
 * glow rising from the bottom, so a photo-less card still belongs to the set.
 */
export function RecipePhoto({ recipe, className = '', markSize = 56 }: {
  recipe: Pick<Recipe, 'photo' | 'photoAlt' | 'brewer' | 'name'>
  className?: string
  markSize?: number
}) {
  if (recipe.photo) {
    return (
      <img
        src={recipe.photo}
        alt={recipe.photoAlt ?? `Photo for ${recipe.name}`}
        loading="lazy"
        decoding="async"
        className={`block bg-surface object-cover ${className}`}
      />
    )
  }
  return (
    <div
      role="img"
      aria-label={`${recipe.brewer}, no photo`}
      className={`grid place-items-center bg-surface text-ink-soft ${className}`}
      style={{ backgroundImage: 'radial-gradient(circle at 50% 120%, rgb(242 107 31 / 0.35), transparent 62%)' }}
    >
      <Mark brewer={recipe.brewer} size={markSize} />
    </div>
  )
}
