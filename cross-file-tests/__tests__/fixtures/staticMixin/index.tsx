import { styled } from 'next-yak';
import { lastChildMixin } from './mixin';

const ListItem = styled.li`
  margin-bottom: 10px;
  &:hover {
    ${lastChildMixin};
  }
`;

export default ListItem;