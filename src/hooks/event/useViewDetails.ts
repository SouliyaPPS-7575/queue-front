import { queryOptions, useSuspenseQuery } from '@tanstack/react-query';
import { Route } from '~/routes/event/view.$eventID';
import { getViewEventDetails } from '~/server/shop';

export const viewProductDetailsQueryOption = (eventID: string) =>
  queryOptions({
    queryKey: ['viewProductDetails', eventID],
    queryFn: () =>
      getViewEventDetails({
        data: { eventID },
      }),
  });

export const useViewDetails = () => {
  const { eventID } = Route.useParams();
  const { data: event, isLoading } = useSuspenseQuery(
    viewProductDetailsQueryOption(eventID),
  );


  return {
    event,
    isLoading,
  };
};
