
import CardStatsHorizontalWithDetails from 'src/@core/components/card-statistics/card-stats-horizontal-with-details'

const Component = () => (
  <CardStatsHorizontalWithDetails
    stats='19,860'
    trendDiff='-14'
    trend='negative'
    title='Active Users'
    avatarColor='success'
    icon='tabler:user-check'
    subtitle='Last week analytics'
  />
)

export default Component
